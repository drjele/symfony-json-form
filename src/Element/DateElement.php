<?php

declare(strict_types=1);

/*
 * Copyright (c) Adrian Jeledintan
 */

namespace Drjele\Symfony\JsonForm\Element;

use DateTime;
use Drjele\Symfony\JsonForm\Exception\InvalidValueException;

final class DateElement extends AbstractElement
{
    public const FORMAT_Y_M_D = 'Y-m-d';
    public const FORMAT_M_D_Y = 'd-m-Y';
    public const FORMAT_Y_M_D_H_I_S = 'Y-m-d H:i:s';
    public const FORMAT_Y_M_D_H_I = 'Y-m-d H:i';

    private string $format;

    public function __construct(string $name, string $format = self::FORMAT_Y_M_D)
    {
        $this->name = $name;
        $this->format = $format;
    }

    protected function getType(): string
    {
        return 'date';
    }

    protected function renderValue($value): array
    {
        if (null !== $value && !\is_string($value) && false === DateTime::createFromFormat($this->format, $value)) {
            throw new InvalidValueException($this->name, $value);
        }

        return [
            'format' => $this->format,
            'value' => $value,
        ];
    }
}
