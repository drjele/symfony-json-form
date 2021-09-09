<?php

declare(strict_types=1);

/*
 * Copyright (c) Adrian Jeledintan
 */

namespace Drjele\Symfony\JsonForm\Element;

use Drjele\Symfony\JsonForm\Exception\Exception;

final class ArrayElement extends AbstractElement
{
    private array $options;
    private string $dataType;
    private string $mode;

    public function setOptions(array $options): self
    {
        $this->options = $options;

        return $this;
    }

    public function setDataType(string $dataType): self
    {
        if (!\in_array($dataType, static::DATA_TYPES, true)) {
            throw new Exception(\sprintf('invalid data type `%s`', $dataType));
        }

        $this->dataType = $dataType;

        return $this;
    }

    public function setMode(string $mode): self
    {
        if (!\in_array($mode, static::MODES, true)) {
            throw new Exception(\sprintf('invalid mode `%s`', $mode));
        }

        $this->mode = $mode;

        return $this;
    }

    public function render($values): array
    {
        if (null !== $values) {
            $values = (array)$values;

            /* @todo refactor for multi level array */
            if ($diff = \array_diff($values, \array_keys($this->options))) {
                $this->throwInvalidValueException();
            }

            /* @todo add more validations */
        }

        return $this->renderBase() + [
            'options' => $this->options,
            'values' => $values,
            'dataType' => $this->dataType,
            'mode' => $this->mode,
        ];
    }

    protected function getType(): string
    {
        return 'array';
    }
}
