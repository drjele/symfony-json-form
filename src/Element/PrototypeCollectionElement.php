<?php

declare(strict_types=1);

/*
 * Copyright (c) Adrian Jeledintan
 */

namespace Drjele\Symfony\JsonForm\Element;

use Drjele\Symfony\JsonForm\Exception\InvalidValueException;
use Drjele\Symfony\JsonForm\Traits\ElementCollectionTrait;

class PrototypeCollectionElement extends AbstractElement
{
    use ElementCollectionTrait;

    private bool $renderDefault;

    public function __construct(
        string $name,
        bool $renderDefault = true
    ) {
        $this->name = $name;
        $this->renderDefault = $renderDefault;
    }

    public function getType(): string
    {
        return 'prototypeCollection';
    }

    public function renderElement($value): array
    {
        if (null !== $value && !\is_array($value)) {
            throw new InvalidValueException($this->name, $value);
        }

        $elements = [];

        foreach (($value ?? []) as $v) {
            $elements[] = $this->renderElements($v);
        }

        if (true === $this->renderDefault && null === $value) {
            $elements[] = $this->renderElements([]);
        }

        return [
            'elements' => $elements,
        ];
    }
}
